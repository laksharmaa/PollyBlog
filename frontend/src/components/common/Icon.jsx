export default function Icon({ name, size = 18 }) {
	const paths = {
		arrow: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
		plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
		play: <path d="m8 5 11 7-11 7z" />,
		pause: <><path d="M8 5v14" /><path d="M16 5v14" /></>,
		moon: <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.7 8.5 8.5 0 1 0 20.5 14.5z" />,
		sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
		menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
		close: <><path d="m6 6 12 12M18 6 6 18" /></>,
		back: <><path d="m15 18-6-6 6-6" /><path d="M9 12h11" /></>,
		volume: <><path d="M5 10v4h3l4 4V6l-4 4z" /><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" /></>,
		minus: <path d="M5 12h14" />,
	};
	return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}