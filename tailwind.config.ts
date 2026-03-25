import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '1rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			serif: [
  				'Source Serif Pro',
  				'ui-serif',
  				'Georgia',
  				'Cambria',
  				'Times New Roman',
  				'Times',
  				'serif'
  			],
  			sans: [
  				'Source Sans Pro',
  				'ui-sans-serif',
  				'system-ui',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Roboto',
  				'Helvetica Neue',
  				'Arial',
  				'Noto Sans',
  				'sans-serif'
  			],
  			mono: [
  				'Source Code Pro',
  				'ui-monospace',
  				'SFMono-Regular',
  				'Menlo',
  				'Monaco',
  				'Consolas',
  				'Liberation Mono',
  				'Courier New',
  				'monospace'
  			]
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
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
  				foreground: 'hsl(var(--muted-foreground))'
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
  			cream: {
  				DEFAULT: 'hsl(var(--cream))',
  				dark: 'hsl(var(--cream-dark))'
  			},
  			copper: {
  				DEFAULT: 'hsl(var(--copper))',
  				light: 'hsl(var(--copper-light))',
  				dark: 'hsl(var(--copper-dark))'
  			},
  			'rose-gold': {
  				DEFAULT: 'hsl(var(--rose-gold))',
  				light: 'hsl(var(--rose-gold-light))'
  			},
  			jade: {
  				DEFAULT: 'hsl(var(--jade))',
  				light: 'hsl(var(--jade-light))',
  				dark: 'hsl(var(--jade-dark))'
  			},
  			wood: {
  				DEFAULT: 'hsl(var(--wood))',
  				light: 'hsl(var(--wood-light))'
  			},
  			charcoal: {
  				DEFAULT: 'hsl(var(--charcoal))',
  				light: 'hsl(var(--charcoal-light))'
  			},
  			burgundy: {
  				DEFAULT: 'hsl(var(--copper))',
  				light: 'hsl(var(--copper-light))',
  				dark: 'hsl(var(--copper-dark))'
  			},
			gold: {
				DEFAULT: 'hsl(var(--gold))',
				light: 'hsl(var(--gold-light))'
			},
			silver: {
				DEFAULT: 'hsl(var(--silver))',
				light: 'hsl(var(--silver-light))'
			},
			bronze: {
				DEFAULT: 'hsl(var(--bronze))',
				light: 'hsl(var(--bronze-light))'
			},
			sage: {
				DEFAULT: 'hsl(var(--jade))',
				light: 'hsl(var(--jade-light))'
			},
			'terra-cotta': {
				DEFAULT: 'hsl(var(--terra-cotta))'
			},
			'soft-clay': {
				DEFAULT: 'hsl(var(--soft-clay))'
			},
			'admin-bg': {
				DEFAULT: 'hsl(var(--admin-bg))'
			},
			allergen: {
  				gluten: 'hsl(var(--allergen-gluten))',
  				dairy: 'hsl(var(--allergen-dairy))',
  				nuts: 'hsl(var(--allergen-nuts))',
  				shellfish: 'hsl(var(--allergen-shellfish))',
  				fish: 'hsl(var(--allergen-fish))',
  				egg: 'hsl(var(--allergen-egg))',
  				soy: 'hsl(var(--allergen-soy))',
  				sesame: 'hsl(var(--allergen-sesame))'
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
  		boxShadow: {
  			card: 'var(--shadow-card)',
  			'card-hover': 'var(--shadow-card-hover)',
  			elevated: 'var(--shadow-elevated)',
  			'2xs': 'var(--shadow-2xs)',
  			xs: 'var(--shadow-xs)',
  			sm: 'var(--shadow-sm)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			xl: 'var(--shadow-xl)',
  			'2xl': 'var(--shadow-2xl)'
  		},
  		keyframes: {
  			'pulse-logo': {
  				'0%, 100%': { opacity: '0.4' },
  				'50%': { opacity: '1' },
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
  			'fade-in': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'fade-in-scale': {
  				from: {
  					opacity: '0',
  					transform: 'scale(0.95)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			'slide-in-right': {
  				from: {
  					transform: 'translateX(100%)',
  					opacity: '0'
  				},
  				to: {
  					transform: 'translateX(0)',
  					opacity: '1'
  				}
  			},
  			'slide-in-left': {
  				from: {
  					transform: 'translateX(-100%)',
  					opacity: '0'
  				},
  				to: {
  					transform: 'translateX(0)',
  					opacity: '1'
  				}
  			},
  			'pulse-gentle': {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0.7'
  				}
  			},
			shimmer: {
  				'0%': {
  					backgroundPosition: '-200% 0'
  				},
  				'100%': {
  					backgroundPosition: '200% 0'
  				}
  			},
  			'line-grow': {
  				'0%': { width: '0%', opacity: '0' },
  				'20%': { opacity: '1' },
  				'100%': { width: '100%', opacity: '1' },
  			},
  			'logo-reveal': {
  				'0%': { opacity: '0', transform: 'translateY(6px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' },
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.4s ease-out',
  			'fade-in-scale': 'fade-in-scale 0.3s ease-out',
  			'slide-in-right': 'slide-in-right 0.4s ease-out',
  			'slide-in-left': 'slide-in-left 0.4s ease-out',
  			'pulse-gentle': 'pulse-gentle 2s ease-in-out infinite',
  			shimmer: 'shimmer 2s linear infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
