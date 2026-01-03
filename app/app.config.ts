export default defineAppConfig({
  ui: {
    colors: {
			primary: 'slatePrimary',
			secondary: 'slateSecondary',
			success: 'slateSuccess',
			info: 'slateInfo',
			warning: 'slateWarning',
			error: 'slateError',
			neutral: 'slateNeutral'
		},
    button: {
      slots: {
        base: 'hover:cursor-pointer',
        
      }
    }
  }
})
