import { trim } from "lodash";
import { User } from "lucide-react";
import mongoose, { mongo } from "mongoose";

//nested replies schema
const replySchema = new mongoose.Schema(
    {
        author: {
            type:mongoose.Schema.ObjectId,ref:'User',required:true
        },
        text : {
            type:String,
            required:true,
            trim:true,
            maxlength:1000
        }
    },
    {
        timestamps:true
    }
);

//main comment schemas
const commentSchema =new mongoose.Schema(
{
    experience  :{
        type: mongoose.type.ObjectId,
        ref:'Experience',
        required:true
    },
    author : {
        type: mongoose.type.ObjectId,
        ref : 'User',
        required:true
    },
    text : {
        type:String,
        required:true,
        trim:true,
        maxlength:1000,
    },
    type : {
        type : String,
        enum: ['doubt', 'tip', 'experience', 'general'],
        default:'general',
    },
    upvotes:[{
        type:mongoose.type.ObjectId,
        ref : 'User'
    }],
    isResolved:{
        type:Boolean,
        default:false
    },
    replies:[
        replySchema
    ]
},{
    timestamps:true
}
);
commentSchema.index({ experience: 1, createdAt: -1 });
export default mongoose.models.Comment || mongoose.model('Comment', commentSchema);