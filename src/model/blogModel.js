const mongoose = require("mongoose")

const blogSchema = mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    }, body: {
        type: String,
        required: true,
        trim: true
    }, authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Author",
        required: true,
    },
    tags: {
        type: [String],
        lowercase: true // Entertainment entertainment 
    },
    category: {
        type: [String],
        required: true,
    },
    subcategory: {
        type: [String],
        lowercase: true
    },
    deletedAt: Date,
    isDeleted: {
        type: Boolean,
        default: false
    },
    publishedAt: Date,
    isPublished: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })


const blogModel = new mongoose.model("Blog", blogSchema)


module.exports = blogModel;