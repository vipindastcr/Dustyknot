const emailid = document.getElementById('typeEmailX')
const nameid = document.getElementById('typeNameX')
const mobileid = document.getElementById('typeMobileX')
const passid = document.getElementById('typePasswordX')
const passid2 =document.getElementById("typePasswordX1")
const error1 = document.getElementById('error1')
const error2 = document.getElementById('error2')
const error3 = document.getElementById('error3')
const error4 = document.getElementById('error4')
const error5 = document.getElementById('error5')
const regformform = document.getElementById('logform')

function emailvalidate(e){
    const emailval = emailid.value
    const emailpattern = /^([a-zA-Z0-9._-]+)@([a-zA-Z.-]+).([a-zA-z]{2,4})$/ 
    if(!emailpattern.test(emailval))
    {    
        error2.style.display = "block"
        error2.innerHTML = "Invalid Format!!"
    }
    else{
        error2.style.display = "none"
        error2.innerHTML = ""
    }
}


function passvalidate(e){
    const passval = passid.value
    const alpha = /[a-zA-Z]/
    const digit = /\d/
    if(passval.length < 8)
    {   
        error4.style.display = "block"
        error4.innerHTML = "Must have atleast 8 characters"
    }
    else if(!alpha.test(passval) || !digit.test(passval) )
    {
        error4.style.display = "block"
        error4.innerHTML = "Should contain Numbers and Alphabets!!"
    }
    else{

        error4.style.display = "none"
        error4.innerHTML = ""
    }
}






function namevalidate() {
    const nameval = nameid.value;
    const namePattern = /^[a-zA-Z\s]*$/; 

    if (nameval.trim() === "") {
        error1.style.display = "block";
        error1.innerHTML = "Please enter a valid Name.";
    } else if (!namePattern.test(nameval)) {
        error1.style.display = "block";
        error1.innerHTML = "Name should contain only letters and spaces.";
    } else {
        error1.style.display = "none";
        error1.innerHTML = "";
    }
}


function mobvalidate(){
    const mobval = mobileid.value
    if(mobval.trim() === "")
    {
        error3.style.display = "block"
        error3.innerHTML = "Please Enter a valid Mobile Number."
    }
    else if(mobval.length < 10 || mobval.length > 10)
    {
        error3.style.display = "block"
        error3.innerHTML = "Please Enter atleast 10 digits."
    }
    else{
        error3.style.display = "none"
        error3.innerHTML = ""
    }   
}

function  confirmpassvalidate(e){
    const passval = passid2.value
    const alpha = /[a-zA-Z]/
    const digit = /\d/
    if(passval.length < 8)
    {   
        error5.style.display = "block"
        error5.innerHTML = "password do not match"
    }
    else if(!alpha.test(passval) || !digit.test(passval) )
    {
        error5.style.display = "block"
        error5.innerHTML = "Should contain Numbers and Alphabets!!"
    }
    else{

        error5.style.display = "none"
        error5.innerHTML = ""
    }
}


emailid.addEventListener('blur', emailvalidate)
nameid.addEventListener('blur',namevalidate)
mobileid.addEventListener('blur',mobvalidate)
passid.addEventListener('blur',passvalidate)
passid2.addEventListener('blur',confirmpassvalidate)



regform.addEventListener('submit',function(e){
        emailvalidate()
        namevalidate()
        mobvalidate()
        passvalidate()
        confirmpassvalidate()

        
        if(error2.innerHTML || error4.innerHTML || error1.innerHTML || error3.innerHTML || error5.innerHTML )
        {
            e.preventDefault()
        }
})