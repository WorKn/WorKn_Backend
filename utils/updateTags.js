const updateTags = async (entity, tags, Model) => {
  let entityTags = [];
  if (entity.tags) {
    entity.tags.forEach((tag) => entityTags.push(tag.id));
  }

  const currentTags = new Set(entityTags);
  const newTags = new Set(tags);

  const tagsToBeAdded = difference(newTags, currentTags);
  const tagsToBeDeleted = difference(currentTags, newTags);

  addTags(entity.id, tagsToBeAdded, Model);
  deleteTags(entity.id, tagsToBeDeleted, Model);
};

const difference = (a, b) => {
  return new Set([...a].filter((x) => !b.has(x)));
};

const addTags = async (entity, tags, Model) => {
  const entityName = getEntityName(Model);

  tags.forEach((tag) => {
    Model.create({ tag, [entityName]: entity }, (err, result) => {
      if (err) console.log(err);
      else console.log(`SUCCESS: new ${Model.modelName} created. Tag = ${result.tag}`);
    });
  });
};

const deleteTags = async (entity, tags, Model) => {
  const entityName = getEntityName(Model);

  tags.forEach((tag) => {
    Model.deleteOne({ tag, [entityName]: entity }, (err, result) => {
      if (err) console.log(err);
      else console.log(`SUCCESS: ${Model.modelName} deleted.`);
    });
  });
};

const getEntityName = (Model) => {
  if (Model.modelName === 'TagUser') return 'user';
  else if (Model.modelName === 'TagOffer') return 'offer';
  else return undefined;
};

module.exports = updateTags;
