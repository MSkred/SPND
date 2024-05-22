<script setup lang="ts">
const { t, locale, setLocale } = useI18n()

definePageMeta({
  layout: 'auth'
})

const fields = [{
  name: 'email',
  type: 'text',
  label: t('input_email_label'),
  placeholder: t('input_email_placeholder'),
  disabled: true
}, {
  name: 'password',
  type: 'password',
  label: t('input_password_label'),
  placeholder: t('input_password_placeholder'),
  disabled: true
}]

const validate = (state: any) => {
  const errors = []
  if (!state.email) errors.push({ path: 'email', message: t('input_email_label') + ' ' + t('input_generic_required_error') })
  if (!state.password) errors.push({ path: 'password', message: `${t('input_password_label') + ' ' + t('input_generic_required_error')}` })
  return errors
}


const { loggedIn, user, session, clear } = useUserSession()
console.log('session is', session);
console.log('user is', user);
const providers = computed(() => [
  {
    label: session.value.user?.google || t('button_continue_google'),
    to: '/auth/google',
    disabled: Boolean(user.value?.google),
    icon: 'i-simple-icons-google',
  },
].map(p => ({
  ...p,
  prefetch: false,
  external: true,
})))

function onSubmit(data: any) {
  console.log('Submitted', data)
}
</script>

<!-- eslint-disable vue/multiline-html-element-content-newline -->
<!-- eslint-disable vue/singleline-html-element-content-newline -->
<template>
  <UCard class="max-w-sm w-full bg-white/75 dark:bg-white/5 backdrop-blur">
    <UAuthForm
      :fields="fields"
      :validate="validate"
      :title="t('welcome')"
      align="top"
      :providers="providers"
      icon="i-heroicons-lock-closed"
      :ui="{ base: 'text-center', footer: 'text-center' }"
      :submit-button="{ label: t('button_continue'), disabled: true, trailingIcon: 'i-heroicons-arrow-right-20-solid' }"
      @submit="onSubmit"
    >
    </UAuthForm>
  </UCard>
</template>