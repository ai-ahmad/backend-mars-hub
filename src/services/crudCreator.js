const deleteFile = require("./deleteFile");
const mediaUrlCreator = require("./mediaUrlCreator");

const crudCreator = (Model, options = {}) => {
  const {
    useMedia = false,
    mediaFields = [],
    mediaFolder = "",
    populateFields = [],
  } = options;

  return {
    getAll: async (req, res) => {
      try {
        const query = Model.find();
        if (populateFields) query.populate(populateFields);
        const items = await query;
        res.status(200).json(items);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    },

    getOne: async (req, res) => {
      try {
        const query = Model.findById(req.params.id);
        if (populateFields) query.populate(populateFields);
        const item = await query;
        if (!item) return res.status(404).json({ message: "Not found" });
        res.status(200).json(item);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    },

    create: async (req, res) => {
      try {
        let media = {};
        if (useMedia) {
          mediaFields.forEach((field) => {
            if (req.files?.[field]) {
              const mediaUrls = Array.isArray(req.files[field])
                ? req.files[field].map((file) =>
                    mediaUrlCreator(file.filename, mediaFolder)
                  )
                : [mediaUrlCreator(req.files[field][0].filename, mediaFolder)];

              media[field] = mediaUrls.length === 1 ? mediaUrls[0] : mediaUrls;
            }
          });
        }

        const newItem = await Model.create({ ...req.body, ...media });
        res.status(201).json(newItem);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    },

    update: async (req, res) => {
      try {
        const existingItem = await Model.findById(req.params.id);
        if (!existingItem) return res.status(404).json({ message: "Not found" });

        let media = {};
        if (useMedia) {
          mediaFields.forEach((field) => {
            if (req.files?.[field]) {
              if (existingItem[field]) {
                if (Array.isArray(existingItem[field])) {
                  existingItem[field].forEach((filePath) => deleteFile(filePath));
                } else {
                  deleteFile(existingItem[field]);
                }
              }

              const mediaUrls = Array.isArray(req.files[field])
                ? req.files[field].map((file) =>
                    mediaUrlCreator(file.filename, mediaFolder)
                  )
                : [mediaUrlCreator(req.files[field][0].filename, mediaFolder)];

              media[field] = mediaUrls.length === 1 ? mediaUrls[0] : mediaUrls;
            }
          });
        }

        const updatedItem = await Model.findByIdAndUpdate(
          req.params.id,
          { ...req.body, ...media },
          { new: true }
        ).populate(populateFields);

        res.status(200).json(updatedItem);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    },

    remove: async (req, res) => {
      try {
        const item = await Model.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: "Not found" });

        if (useMedia) {
          mediaFields.forEach((field) => {
            if (item[field]) {
              if (Array.isArray(item[field])) {
                item[field].forEach((filePath) => deleteFile(filePath));
              } else {
                deleteFile(item[field]);
              }
            }
          });
        }

        res.status(200).json({ message: "Deleted successfully" });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    },
  };
};

module.exports = crudCreator;
