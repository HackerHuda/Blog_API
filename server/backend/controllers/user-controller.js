import mongoose from "mongoose";
import User from "../model/User.js";
import bcrypt from 'bcryptjs';

export const getAllUser = async(req,res,next)=>{
    let users;
    try{
        users=await User.find();
    }catch(err){
        console.log(err);
    }
    if(!users){
        return res.status(404).json({message:"No Users Found!!!"});
    }
    return res.status(200).json({users});
};
export const signup = async (req,res,next)=>{
    const {name,email,password}=req.body;

    let existingUser;
    try{
        existingUser = await User.findOne({email});
    }catch(err){
        return console.log(err);
    }
    if (existingUser){
        return res
        .status(400)
        .json({message:"User Already Exist! Login instead"});
    }
    const hashedPassword = bcrypt.hashSync(password);

    const user= new User ({
        name,
        email,
        password:hashedPassword,
        blogs:[]
    });
    
    try{
       await user.save();
    }catch(err){
        return console.log(err);
    }
    return res.status(201).json({user});
}

export const login = async (req,res,next) =>{
    const {email,password}=req.body;
    let existingUser;
    try{
        existingUser = await User.findOne({email});
    }catch(err){
        return console.log(err);
    }
    if (!existingUser){
        return res
        .status(404)
        .json({message:"Couldnt find user"});
    }

    const isPasswordCorrect = bcrypt.compareSync(password,existingUser.password);
    if(!isPasswordCorrect){
        return res.status(400).json({message:"incorrect password"});
    }
    return res.status(200).json({message:"login successful"});
}

export const followUser = async (res,req)=>{
    if(req.body.userId !==req.params.id){
        try{
            const user =await User.findById(req.params.id);
            const currentuser= await User.fintById(req.params.userId);
            if(!user.followers.include(req.body.userId)){
                await user.updateOne({$push:{followers:req.body.userId}});
            }
            else{
                res.status(403).json("you already followed");
            }
        }
        catch{
            res.status(500).json(err);
        }
        
    }
    else{
        res.status(403).json({message:"you cant follow yourself"});
    }
}