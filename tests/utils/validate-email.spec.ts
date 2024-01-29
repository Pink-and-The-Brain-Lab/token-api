import { ValidateEmail } from "../../src/utils/validate-email";


describe('validateEmail', () => {
    let validateEmail: ValidateEmail;

    beforeEach(() => {
        validateEmail = new ValidateEmail();
    });

    it('should validate email', () => {
        const response = validateEmail.validate('email@mail.com');
        expect(response).toBeTruthy();    
    });

    it('should not validate email', () => {
        const response = validateEmail.validate('emailmail.com');
        expect(response).toBeFalsy();    
    });
});
