module.exports.resolve = async function(person){
  const valuesToCreate = [];
  const valuesToUpdate = [];
  const fields = await PersonCustomFields.find();
  const currentValues = await PersonCustomValues.find({person: person.id});
  fields.forEach(x => {
    const currentValue = currentValues.find(cv => cv.field == x.id);
    if (currentValue){
      valuesToUpdate.push({
        id: currentValue.id,
        value: person[x.name]
      })
    } else {
      valuesToCreate.push({
        field: x.id,
        person: person.id,
        value: person[x.name]
      })
    }
  });
  await PersonCustomValues.createEach(valuesToCreate);
  valuesToUpdate.forEach(async x => {
    await PersonCustomValues.update({id: x.id}).set({id: x.id, value: x.value})
  });
}