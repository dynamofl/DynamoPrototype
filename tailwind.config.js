/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			sans: [
  				'Inter Variable',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Roboto',
  				'Oxygen',
  				'Ubuntu',
  				'Cantarell',
  				'Fira Sans',
  				'Droid Sans',
  				'Helvetica Neue',
  				'sans-serif'
  			]
  		},
  		fontWeight: {
  			'350': '350',
  			'450': '450',
  			'550': '550',
  			'650': '650',
  			'750': '750',
  			'850': '850'
  		},
  	
  		colors: {
  			gray: {
  				'0': 'rgb(var(--gray-0) / <alpha-value>)',
  				'50': 'rgb(var(--gray-50) / <alpha-value>)',
  				'100': 'rgb(var(--gray-100) / <alpha-value>)',
  				'200': 'rgb(var(--gray-200) / <alpha-value>)',
  				'300': 'rgb(var(--gray-300) / <alpha-value>)',
  				'400': 'rgb(var(--gray-400) / <alpha-value>)',
  				'500': 'rgb(var(--gray-500) / <alpha-value>)',
  				'600': 'rgb(var(--gray-600) / <alpha-value>)',
  				'700': 'rgb(var(--gray-700) / <alpha-value>)',
  				'800': 'rgb(var(--gray-800) / <alpha-value>)',
  				'900': 'rgb(var(--gray-900) / <alpha-value>)',
  				'950': 'rgb(var(--gray-950) / <alpha-value>)'
  			},
  			red: {
  				'50': 'rgb(var(--red-50) / <alpha-value>)',
  				'100': 'rgb(var(--red-100) / <alpha-value>)',
  				'200': 'rgb(var(--red-200) / <alpha-value>)',
  				'300': 'rgb(var(--red-300) / <alpha-value>)',
  				'400': 'rgb(var(--red-400) / <alpha-value>)',
  				'500': 'rgb(var(--red-500) / <alpha-value>)',
  				'600': 'rgb(var(--red-600) / <alpha-value>)',
  				'700': 'rgb(var(--red-700) / <alpha-value>)',
  				'800': 'rgb(var(--red-800) / <alpha-value>)',
  				'900': 'rgb(var(--red-900) / <alpha-value>)',
  				'950': 'rgb(var(--red-950) / <alpha-value>)'
  			},
  			green: {
  				'50': 'rgb(var(--green-50) / <alpha-value>)',
  				'100': 'rgb(var(--green-100) / <alpha-value>)',
  				'200': 'rgb(var(--green-200) / <alpha-value>)',
  				'300': 'rgb(var(--green-300) / <alpha-value>)',
  				'400': 'rgb(var(--green-400) / <alpha-value>)',
  				'500': 'rgb(var(--green-500) / <alpha-value>)',
  				'600': 'rgb(var(--green-600) / <alpha-value>)',
  				'700': 'rgb(var(--green-700) / <alpha-value>)',
  				'800': 'rgb(var(--green-800) / <alpha-value>)',
  				'900': 'rgb(var(--green-900) / <alpha-value>)',
  				'950': 'rgb(var(--green-950) / <alpha-value>)'
  			},
  			blue: {
  				'50': 'rgb(var(--blue-50) / <alpha-value>)',
  				'100': 'rgb(var(--blue-100) / <alpha-value>)',
  				'200': 'rgb(var(--blue-200) / <alpha-value>)',
  				'300': 'rgb(var(--blue-300) / <alpha-value>)',
  				'400': 'rgb(var(--blue-400) / <alpha-value>)',
  				'500': 'rgb(var(--blue-500) / <alpha-value>)',
  				'600': 'rgb(var(--blue-600) / <alpha-value>)',
  				'700': 'rgb(var(--blue-700) / <alpha-value>)',
  				'800': 'rgb(var(--blue-800) / <alpha-value>)',
  				'900': 'rgb(var(--blue-900) / <alpha-value>)',
  				'950': 'rgb(var(--blue-950) / <alpha-value>)'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'var(--muted-foreground)'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
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
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
