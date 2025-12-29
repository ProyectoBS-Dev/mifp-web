import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class', 'class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			'background-soft': 'var(--background-soft)',
  			'background-mute': 'var(--background-mute)',
  			foreground: 'hsl(var(--foreground))',
  			'foreground-soft': 'var(--foreground-soft)',
  			'foreground-mute': 'var(--foreground-mute)',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				light: 'var(--primary-light)',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				light: 'var(--secondary-light)',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			'border-hover': 'var(--border-hover)',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			grade: {
  				fail: 'var(--grade-fail)',
  				pass: 'var(--grade-pass)',
  				good: 'var(--grade-good)',
  				excellent: 'var(--grade-excellent)'
  			},
  			vt: {
  				green: '#42b883',
  				'green-light': '#42d392',
  				'green-lighter': '#35eb9a',
  				'green-dark': '#33a06f',
  				'green-darker': '#155f3e',
  				blue: '#3b8eed',
  				'blue-light': '#549ced',
  				'blue-lighter': '#50a2ff',
  				'blue-dark': '#3468a3',
  				'blue-darker': '#255489',
				sky: '#3bc0ed',
				'sky-light': '#549ced',
				'sky-lighter': '#50a2ff',
				'sky-dark': '#3468a3',
				'sky-darker': '#255489',
  				white: '#ffffff',
  				'white-soft': '#f9f9f9',
  				'white-mute': '#f1f1f1',
  				black: '#1a1a1a',
  				'black-pure': '#000000',
  				'black-soft': '#242424',
  				'black-mute': '#2f2f2f',
  				gray: '#8e8e8e',
  				'gray-light-1': '#aeaeae',
  				'gray-light-2': '#c7c7c7',
  				'gray-light-3': '#d1d1d1',
  				'gray-light-4': '#e5e5e5',
  				'gray-light-5': '#f2f2f2',
  				'gray-dark-1': '#636363',
  				'gray-dark-2': '#484848',
  				'gray-dark-3': '#3a3a3a',
  				'gray-dark-4': '#282828',
  				'gray-dark-5': '#202020',
  				indigo: '#213547',
  				'indigo-soft': '#476582',
  				'indigo-light': '#aac8e4',
  				yellow: '#ffc517',
  				'yellow-light': '#ffe417',
  				'yellow-dark': '#e0ad15',
  				red: '#ed3c50',
  				'red-light': '#f43771',
  				'red-dark': '#cd2d3f',
  				purple: '#de41e0',
  				'purple-light': '#e936eb',
  				'purple-dark': '#823c83'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-onest)',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		keyframes: {
  			'fade-in': {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			'fade-out': {
  				'0%': {
  					opacity: '1'
  				},
  				'100%': {
  					opacity: '0'
  				}
  			},
  			'slide-up': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-down': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(-10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-in-right': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'pulse-soft': {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0.7'
  				}
  			}
  		},
  		animation: {
  			'fade-in': 'fade-in 0.2s ease-out',
  			'fade-out': 'fade-out 0.2s ease-out',
  			'slide-up': 'slide-up 0.3s ease-out',
  			'slide-down': 'slide-down 0.3s ease-out',
  			'slide-in-right': 'slide-in-right 0.3s ease-out',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'pulse-soft': 'pulse-soft 2s ease-in-out infinite'
  		}
  	}
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
