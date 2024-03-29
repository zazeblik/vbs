const request = require("request-promise").defaults({jar: true});
const cyrillicToTranslit = require('cyrillic-to-translit-js');
const GroupType = require('../../enums').GroupType;

const customValuesResolver =  require('../services/PersonCustomValuesResolver');

const URL = 'http://crm.ballroom12.ru';

module.exports.MigratePersonsAndGroups = async function(providerId) {
  const requiredFields = [
    {label: 'Номер книжки', comparer: 'book_number'}, 
    {label: 'Класс', comparer: 'dance_class'}, 
    {label: 'Дата присвоения', comparer: 'dance_class_approve_date'}, 
    {label: 'Разряд', comparer: 'rank'},
    {label: 'Телефон', comparer: 'phone'}, 
    {label: 'Адрес', comparer: 'address'},
    {label: 'Партнер', comparer: 'partner'}
  ];
  requiredFields.forEach(x => { x.name = cyrillicToTranslit().transform(x.label, "_") });
  request({ uri: `${URL}/auth/login`, qs: { login: 'b12', password: 'Qa1Ws2Ed3Rf4' } })
    .then(async () => {
      const fields = await resolveFields(requiredFields, providerId);
      const personMappings = await resolvePersons(fields, requiredFields, providerId);
      await resolveGroups(personMappings, providerId);
    })
    .catch((err) => { console.log(err) });
}

async function resolveFields(requiredFields, providerId) {
  const currentFields = await PersonCustomFields.find({provider: providerId});
  const currentFieldLabels = currentFields.map(x => x.label);
  const labelsToCreate = requiredFields
    .filter(x => !currentFieldLabels.includes(x.label))
    .map(x => { 
      return { 
        label: x.label,
        name: x.name,
        provider: providerId
      } 
    });
  const createdFields = await PersonCustomFields.createEach(labelsToCreate).fetch();
  return [...currentFields, ...createdFields];
}

async function resolvePersons(fields, requiredFields, providerId) {
  const persons = await request({ uri: `${URL}/persons`, qs: { populate: false }, json: true });
  persons.forEach(x => { x.name = x.name.trim() });
  const currentPersons = await Persons.find({provider: providerId}).populate('groups');
  const currentPersonsNames = currentPersons.map(x => x.name);
  const personsToCreate = persons
    .filter(x => !currentPersonsNames.includes(x.name))
    .map(x => { return { name: x.name, birthday: x.birthday, provider: providerId } })
    .reduce((x, y) => x.findIndex(e => e.name == y.name ) < 0 ? [...x, y] : x, []);
  const personsToUpdate = persons.filter(x => currentPersonsNames.includes(x.name));
  const createdPersons = await Persons.createEach(personsToCreate).fetch();
  personsToUpdate.forEach(async person => {
    const personId = currentPersons.find(x => x.name == person.name).id;
    await Persons.update({id: personId, provider: providerId}, {id: personId, birthday: person.birthday, provider: providerId});
  });
  const personsToFill = [...createdPersons, ...currentPersons];
  const personMappings = [];
  for (let i = 0; i < persons.length; i++) {
    const person = persons[i];
    const personId = personsToFill.find(x => x.name == person.name).id;
    const personToUpdate = { id: personId };
    for (let j = 0; j < fields.length; j++) {
      const field = fields[j];
      const mappingField = requiredFields.find(x => x.name == field.name);
      if (!mappingField) continue;
      if (mappingField.comparer == 'partner') {
        const partner = persons.find(x => x.id == person[mappingField.comparer])
        personToUpdate[mappingField.name] = partner ? partner.name : '';
      } else {
        personToUpdate[mappingField.name] = person[mappingField.comparer];
      }
    }
    await customValuesResolver.resolve(personToUpdate, providerId);
    personMappings.push({localId: personId, remoteId: person.id});
  }
  return personMappings;
}

async function resolveGroups(personMappings, providerId){
  const groups = await request({ 
    uri: `${URL}/groups`, 
    qs: { populate: 'members,archived,trener', in_archive: false }, 
    json: true
  });
  const places = await resolvePlaces(groups, providerId);
  groups.forEach(x => { 
    x.label = x.label.trim();
    x.trener.name = x.trener.name.trim();
    x.members.forEach(y => { y.name = y.name.trim() });
  });
  const currentGroups = await Groups.find({provider: providerId});
  const currentGroupsNames = currentGroups.map(x => x.name);
  const groupsToCreate = groups
    .filter(x => !currentGroupsNames.includes(x.label))
    .map(x => {
      const place = places.find(y => y.name == x.hall);
      const schedule = x.schedule 
        ? x.schedule.split(',').map(x => `${x}:00 ${place.id}`).join(',')
        : '';
      return {
        name: x.label,
        defaultPlace: place.id,
        defaultInstructor: personMappings.find(y => y.remoteId == x.trener.id).localId,
        defaultDuration: x.duration,
        type: x.type == 'индивидуальная' ? GroupType.Personal : GroupType.General,
        cost: x.sum,
        onceCost: x.once_sum,
        provider: providerId,
        schedule: schedule
      }
    });
  const groupsToUpdate = groups.filter(x => currentGroupsNames.includes(x.label));
  const createdGroups = await Groups.createEach(groupsToCreate).fetch();
  groupsToUpdate.forEach(async group => {
    const currentGroup = currentGroups.find(x => x.name == group.label);
    const groupId = currentGroup.id;
    const schedule = group.schedule.split(',').map(x => `${x}:00 ${currentGroup.defaultPlace}`).join(',');
    await Groups.update({id: groupId, provider: providerId}, {
      id: groupId, 
      defaultPlace: places.find(y => y.name == group.hall).id,
      defaultInstructor: personMappings.find(y => y.remoteId == group.trener.id).localId,
      defaultDuration: group.duration,
      type: group.type == 'индивидуальная' ? GroupType.Personal : GroupType.General,
      cost: group.sum,
      onceCost: group.once_sum,
      provider: providerId,
      schedule: schedule
    });
  });
  const groupsToFill = [...createdGroups, ...currentGroups];
  groups.forEach(async group => {
    const groupId = groupsToFill.find(x => x.name == group.label).id;
    const groupMembers = group.members.filter(x => personMappings.find(y => y.remoteId == x.id))
    const archivedIds = group.archived.map(x => x.id);
    const memberIds = groupMembers
      .filter(x => !archivedIds.includes(x.id))
      .map(x => personMappings.find(y => y.remoteId == x.id).localId)
    await Groups.replaceCollection(groupId, 'members').members(memberIds)
  });
}

async function resolvePlaces(groups, providerId) {
  const placeNames = [...new Set(groups.map(x => x.hall))];
  for (let i = 0; i < placeNames.length; i++) {
    const placeName = placeNames[i];
    const place = await Places.findOne({name: placeName, provider: providerId});
    if (!place) {
      await Places.create({name: placeName, color: resolveColor(placeName), provider: providerId})
    }
  }
  return await Places.find({provider: providerId});
}

function resolveColor(name) {
  switch(name) {
    case 'серый': return '#cccccc';
    case 'дргуой': return '#e83e8c';
    case 'фиолетовый': return '#6f42c1';
    case 'тренажерный': return '#fd7e14';
    default: return '#00e1ff'
  }
}