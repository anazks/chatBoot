var express = require('express');
var router = express.Router();
var categoryModel = require('../Model/CategoryMode')
var QuestionModel = require('../Model/QuestionModel')
var AvatarMOdel = require('../Model/AvatarsModel')
// const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('Admin/Login', { title: 'Express' });
});
router.get('/home', async (req,res)=>{
  let category =  await categoryModel.find()
  let question = await QuestionModel.find()
  let avatar = await AvatarMOdel.find()
  console.log(category)
  res.render('Admin/Home',{category,question,avatar})
})

router.post('/login',(req,res)=>{
  try {
    console.log(req.body)
    let {email} = req.body;
    let {password} = req.body;
    if(email== 'admin@gamil.com' && password == '123'){
      res.redirect('/home')
    }
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
})
router.post('/AddCategory', async (req,res)=>{
  try {
      console.log(req.body)
     await  categoryModel.create(req.body)
     res.redirect('/home')
  } catch (error) {
    console.log(error)
  }
})

router.get('/deletCategory/:id',async (req,res)=>{
  try {
    let id = req.params.id
    await categoryModel.deleteOne({_id:id})
    console.log("deleted")
    res.redirect('/home')
  } catch (error) {
    console.log(error)
  }
})
router.post('/addQuestion',async (req,res)=>{
  try {
    await QuestionModel.create(req.body)
    console.log("added questions")
    res.redirect('/home')
  } catch (error) { 
    console.log(error) 
  }
})

router.get('/delete-question/:id',async(req,res)=>{
  try {
    let id = req.params.id
    await QuestionModel.deleteOne({_id:id})
    console.log("deleted")
    res.redirect('/home')
  } catch (error) {
    console.log(error)
  }
})
router.post('/add-avatar', async(req,res)=>{
  try {
    await  AvatarMOdel.create(req.body)
    res.redirect('/home')
  } catch (error) {
    console.log(error); 
  }
})

router.get('/delete-avatar/:id',async (req,res)=>{
  try {
      let id = req.params.id
      await AvatarMOdel.deleteOne({_id:id})
      res.redirect('/home')
  } catch (error) {
    console.log(error)
  }
})
router.get('/get-avatar',async (req,res)=>{
  try {
    console.log("geting avatar")
    let avatar = await AvatarMOdel.find()
    avatar = avatar[0]
    res.json(avatar)
  } catch (error) {
    
  }
})
router.get('/Get-answer',async (req,res)=>{
  try {
    let {id} =req.body;
    let answer = await QuestionModel.find({_id:id})
    res.json(answer)
  } catch (error) {
    res.json("error while fetch data")
  }
})
router.get('/get-allCategory', async(req,res)=>{
  try {
    let category = await categoryModel.find()
    res.json(category)
  } catch (error) {
    console.log(error)
  }
})
router.get('/get-categoryBasedQuestion/:cate',async (req,res)=>{
  try {
    let cate = req.params.cate
    let question = await QuestionModel.find({category:cate})
    console.log(question)
    res.json(question)
  } catch (error) {
    console.log(error)
  }
})
// const genAI = new GoogleGenerativeAI("AIzaSyDX-ZlUY-ISO6dBysdYsEZtEUs4K7LXxGI");
// const genAI = new GoogleGenerativeAI("AIzaSyDX-ZlUY-ISO6dBysdYsEZtEUs4K7LXxGI");

const gemini_api_key = "AIzaSyDX-ZlUY-ISO6dBysdYsEZtEUs4K7LXxGI";
const googleAI = new GoogleGenerativeAI(gemini_api_key);


router.post('/get-webisteQueston', async (req, res) => {
try {
  console.log(req.body)
  const geminiConfig = {
    temperature: 0.9,
    topP: 1,
    topK: 1,
    maxOutputTokens: 4096,
  };
  const geminiModel = googleAI.getGenerativeModel({
    model: "gemini-pro",
    geminiConfig,
  });
  const generate = async () => {
    try {
      let weburl = 'https://www.nsspolytechnic.ac.in/'
      const filePath = "/File/Content.txt";
      

      // fs.readFile(filePath, "utf8", async (err, textContent) => {
      //   if (err) {
      //     console.error(`Error reading file: ${err.message}`);
      //     return;
      //   }
      let {question} = req.body
      fs.readFile(filePath,"utf8",async (err,textContent)=>{
        if(err){
          console.log(err)
        }
        console.log(textContent)
        const prompt = ` ${textContent} in NSS Polytechnic College pandalam ,and answer the ${question}`;
        const result = await geminiModel.generateContent(prompt);
        const response = result.response;
        console.log(response.text());
        res.json(response.text());
      })
        
      // let {question} = req.body
      // const prompt = ` ${question} in NSS Polytechnic College pandalam refer this link ${weburl}`;
      // const result = await geminiModel.generateContent(prompt);
      // const response = result.response;
      // console.log(response.text());
      // res.json(response.text());
    } catch (error) {
      console.log("response error", error);
    }
  };
   
  generate();
} catch (error) {
  console.log(error)
}
});
module.exports = router;
