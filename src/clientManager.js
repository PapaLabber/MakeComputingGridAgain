//export {validateForm};

//import signup from './src';

const data = FileSystem.readFileSync("clientManager.json");
const jsonData = JSON.parse(data);
// Tracks connected clients

//json function

function validateForm(userData){

    const signUpForm = document.getElementById("userData");
      let userName=String(document.getElementsByName("username").value);
      let email=String(document.getElementsByName("email").value);
      let password=String(document.getElementsByName("password").value);
    

      console.log(`${userName} ${password} ${email}`)

    //if(userData.has("username") && userData.has("email") && userData.has("password")){
    //  let userName=String(userData.get("username"));
    //  let email=String(userData.get("email"));
    //  let password=String(userData.get("password"));
    //
    //      //return a fresh object with ONLY the validated fields
    //      let validUserData={userName: userName, email: email, password: password};
    //      console.log("Validated: "); console.log(validUserData);
    //      return validUserData;
    //   }
      

      console.log("Before adding data", JSON.stringify(jsonData,null,4));

    jsonData.users.push({
        username:`${userName}`,
        email:`${email}`,
        password:`${password}`,
    })
    
    const jsonString = JSON.stringify(jsonData)

    fs.writeFileSync('clientManager.json',jsonString,'utf-8',(err)=>{
        if (err) throw err;
        console.log("Data added to file");
    });
    const update_data = FileSystem.readFileSync('clientManager.json');
    const updated_jsonData = JSON.parse(updata_data);
    console.log("After adding data", JSON.stringify(updated_jsonData,null,4));
}
    //validate login function
    



    /*database*/