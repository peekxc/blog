module.exports = { 
	content: ['./_includes/**/*.pug'],
	important: true,
	separator: '_', // For better looking pug code! => classes are .text_center, hover_*, etc.
	plugins: [
		require('@tailwindcss/typography')
	],
	theme: {
		colors: {
			transparent: 'transparent',
			orange: '#f05e23', 
			white: '#ffffff', 
			lightgray: '#cecece', 
			black: '#000000',
			gray: {
				'': '#808080',
				'100': '#f5f5f5',
				'200': '#eeeeee',
				'300': '#e0e0e0',
				'400': '#bdbdbd',
				'500': '#9e9e9e',
				'600': '#757575',
				'700': '#616161',
				'800': '#424242',
				'900': '#212121',
			}, 
			red: '#ff0000'
		}
  },
  variants: {
		borderColor: ['responsive', 'hover', 'focus', 'active'],
		backgroundColor: ['responsive', 'hover', 'focus', 'active'], 
		textColor: ['responsive', 'hover', 'focus', 'active'],
		overflow: ['responsive', 'hover', 'focus'], 
		overscrollBehavior: ['responsive', 'hover', 'focus']
	},
	fontSize: {
		xs: ['0.75rem', { lineHeight: '1rem' }],
		sm: ['0.875rem', { lineHeight: '1.25rem' }],
		base: ['1rem', { lineHeight: '1.5rem' }],
		lg: ['1.125rem', { lineHeight: '1.75rem' }],
		xl: ['1.25rem', { lineHeight: '1.75rem' }]
	},
	fontWeight: {
		thin: '100',
		extralight: '200',
		light: '300',
		normal: '400',
		medium: '500',
		semibold: '600',
		bold: '700',
		extrabold: '800',
		black: '900',
	}, 
	corePlugins: {
		preflight: false
	}
}
