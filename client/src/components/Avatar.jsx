const COLORS = ['#0b6e6e', '#3b5bdb', '#9c36b5', '#d9480f', '#1c7ed6', '#2b8a3e', '#c2255c'];

// Round badge with the person's initials (colour is picked from the name)
export default function Avatar({ name, size = 28 }) {
  if (!name) return <span className="avatar none" style={{ width: size, height: size }}>–</span>;
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % COLORS.length;
  return (
    <span className="avatar" title={name} style={{ width: size, height: size, fontSize: size * 0.4, background: COLORS[h] }}>
      {initials}
    </span>
  );
}
