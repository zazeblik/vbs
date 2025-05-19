module.exports.resolve = async function(person, providerId){
  const valuesToCreate = [];
  const valuesToUpdate = [];
  const fields = await PersonCustomFields.find({provider: providerId});
  const currentValues = await PersonCustomValues.find({person: person.id, provider: providerId});
  fields.forEach(x => {
    const currentValue = currentValues.find(cv => cv.field == x.id);
    if (currentValue){
      valuesToUpdate.push({
        id: currentValue.id,
        value: person[x.name],
        provider: providerId
      })
    } else {
      valuesToCreate.push({
        field: x.id,
        person: person.id,
        value: person[x.name],
        provider: providerId
      })
    }
  });
  await PersonCustomValues.createEach(valuesToCreate);
  valuesToUpdate.forEach(async x => {
    await PersonCustomValues.update({id: x.id, provider: providerId}).set({id: x.id, value: x.value, provider: providerId}).fetch();
  });
}