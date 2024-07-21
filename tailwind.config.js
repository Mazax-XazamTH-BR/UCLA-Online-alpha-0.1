/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      textShadow: {
        'custom-shadow': '#777 1px 1px, #888 2px 2px, #999 3px 3px, #aaa 4px 4px, #bbb 5px 5px, #ccc 6px 6px, #ddd 7px 7px, #eee 8px 8px, #fff 9px 9px, #eee 10px 10px, #ddd 11px 11px, #ccc 12px 12px, #bbb 13px 13px, #aaa 14px 14px, #999 15px 15px, #888 16px 16px, #777 17px 17px, #666 18px 18px, #555 19px 19px, #444 20px 20px, #333 21px 21px, #222 22px 22px, #111 23px 23px, #000 24px 24px',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.text-shadow-custom': {
          textShadow: '#777 1px 1px, #888 2px 2px, #999 3px 3px, #aaa 4px 4px, #bbb 5px 5px, #ccc 6px 6px, #ddd 7px 7px, #eee 8px 8px, #fff 9px 9px, #eee 10px 10px, #ddd 11px 11px, #ccc 12px 12px, #bbb 13px 13px, #aaa 14px 14px, #999 15px 15px, #888 16px 16px, #777 17px 17px, #666 18px 18px, #555 19px 19px, #444 20px 20px, #333 21px 21px, #222 22px 22px, #111 23px 23px, #000 24px 24px',
        },
      });
    },
  ],
}