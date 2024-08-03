function validation(values) {
    let error = {};
    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]{8,}$/
    const name_pattern = /^[A-Za-z\s'-]+$/
    const matriculation_pattern = /^[0-9]+$/

    if(values.name === ""){
        error.name = 'Name should not be empty';
    } else if (!name_pattern.test(values.name)){
        error.name = "Name should not have numbers or special characters etc.";
    } else {
        error.name = "";
    }


    if(values.matriculation === ""){
        error.matriculation = 'Matriculation No. should not be empty';
    } else if (!matriculation_pattern.test(values.matriculation)){
        error.matriculation = "Matriculation No. should only have numbers";
    } else {
        error.matriculation = "";
    }

    if(values.email === ""){
        error.email = 'Email should not be empty';
    } else if (!email_pattern.test(values.email)){
        error.email = "Email didn't match";
    } else {
        error.email = "";
    }

    if (values.password === "") {
        error.password = "Password should not be empty";
    } else if (!password_pattern.test(values.password)) {
        error.password = "Password should have at least one digit, one lowercase letter, one uppercase letter, and one special character";
    } else {
        error.password = "";
    }

    return error;
}

export default validation;