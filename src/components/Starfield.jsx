export default function Starfield() {
  return (
    <div className="starfield" aria-hidden="true">
      {Array.from({ length: 45 }, (_, index) => (
        <i
          key={index}
          style={{
            "--x": `${(index * 37) % 100}%`,
            "--y": `${(index * 53) % 100}%`,
            "--delay": `${(index % 7) * 0.4}s`,
            "--size": `${1 + (index % 3)}px`,
          }}
        />
      ))}
    </div>
  );
}
