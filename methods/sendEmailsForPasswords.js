const mailjet = require ('node-mailjet')
.connect('7de989823c997c60caf291c527c9809b', 'f4172ec7a9010c9626573c481ff89b3d')
module.exports=function(email,token,callback){
const request = mailjet
.post("send", {'version': 'v3.1'})
.request({
  "Messages":[
    {
      "From": {
        "Email": "princesh54556@gmail.com",
        "Name": "Prince"
      },
      "To": [
        {
          "Email": email,
          "Name": "we dont need"
        }
      ],
      "Subject": "Greetings from xyz bazar.",
      "TextPart": "Please verify",
      "HTMLPart": ` <h4>verify</h4> <h1><a href="http://localhost:3000/changepassword/${token}" >click here</a></h1>`,
      "CustomID": "AppGettingStartedTest"
    }
  ]
})
request
  .then((result) => {
    console.log(result.body)
    callback(null,result.body)
  })
  .catch((err) => {
    console.log(err.statusCode)
    callback(err,null)
  })
}