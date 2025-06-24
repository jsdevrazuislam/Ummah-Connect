import multer from 'multer'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const memoryStorage = multer.memoryStorage();

export const uploadMulter = multer({
    storage: memoryStorage,
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
});

export const upload = multer({ storage })