export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'fr',
  messages: {
    en: {
      welcome: 'Welcome',
      input_email_placeholder: 'Enter your email',
      input_email_label: 'Email',
      input_password_placeholder: 'Enter your password',
      input_password_label: 'Password',
      input_generic_required_error: 'is required',
      button_continue: 'Continue',
      button_continue_google: 'Continue with Google'
    },
    fr: {
      welcome: 'Bienvenue',
      input_email_placeholder: 'Entrez votre email',
      input_email_label: 'Email',
      input_password_placeholder: 'Entrez votre mot de passe',
      input_password_label: 'Mot de passe',
      input_generic_required_error: 'est obligatoire',
      button_continue: 'Continuez',
      button_continue_google: 'Continuez avec Google'
    }
  }
}))