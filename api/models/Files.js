const FilesBlock = require('../../enums').FilesBlock

module.exports = {
  attributes: {
    file: {
      type: 'string',
      required: true
    },
    name: {
      type: 'string',
      required: true
    },
    block: {
      type: 'number',
      defaultsTo: FilesBlock.Tournaments,
      isIn: [FilesBlock.Tournaments, FilesBlock.Photo, FilesBlock.Slider]
    }
  },
};

