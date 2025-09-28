import React, { useState } from "react";

// Roblox UI Live Preview com editor de código embutido
export default function RobloxUIEditor() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [codeEdit, setCodeEdit] = useState('');
  const canvasSize = { width: 360, height: 640 };

  function addElement(type) {
    const id = Date.now().toString();
    const base = {
      id,
      type,
      props: {
        Text: type === "TextButton" || type === "TextLabel" || type === "TextBox" ? type : "",
        Size: { X: 0.5, Y: 0.06 },
        Position: { X: 0.25, Y: 0.05 + elements.length * 0.08 },
        BackgroundColor3: "#1f2937",
        TextColor3: "#ffffff",
        AnchorPoint: { X: 0, Y: 0 },
      },
    };
    setElements((s) => [...s, base]);
    setSelectedId(id);
  }

  function updateSelected(updater) {
    setElements((prev) => prev.map((el) => (el.id === selectedId ? { ...el, props: { ...el.props, ...updater(el.props) } } : el)));
  }

  function removeSelected() {
    setElements((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  }

  function toPx(size, axis) {
    return Math.round(size * (axis === "X" ? canvasSize.width : canvasSize.height));
  }

  function renderElement(el) {
    const { Size, Position, BackgroundColor3, Text, TextColor3 } = el.props;
    const style = {
      position: "absolute",
      left: `${Math.round(Position.X * 100)}%`,
      top: `${Math.round(Position.Y * 100)}%`,
      transform: `translate(-${el.props.AnchorPoint?.X * 100 || 0}%, -${el.props.AnchorPoint?.Y * 100 || 0}%)`,
      width: `${Math.round(Size.X * 100)}%`,
      height: `${Math.round(Size.Y * 100)}%`,
      background: BackgroundColor3,
      color: TextColor3,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      overflow: "hidden",
      border: selectedId === el.id ? "2px solid #60a5fa" : "1px solid rgba(255,255,255,0.06)",
      cursor: "pointer",
    };

    if (el.type === "TextLabel" || el.type === "TextButton" || el.type === "TextBox") {
      return (
        <div key={el.id} style={style} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}>
          <div style={{ pointerEvents: "none", fontSize: 14 }}>{Text}</div>
        </div>
      );
    }

    return (
      <div key={el.id} style={style} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}>
        <div style={{ pointerEvents: "none", fontSize: 12 }}>{el.type}</div>
      </div>
    );
  }

  function generateLuau() {
    if(codeEdit.trim() !== '') return codeEdit;
    const lines = [];
    lines.push("local screenGui = Instance.new(\"ScreenGui\")");
    lines.push("screenGui.Name = \"PreviewGui\"");
    lines.push("screenGui.Parent = game.Players.LocalPlayer:WaitForChild(\"PlayerGui\")");
    lines.push("");

    elements.forEach((el, i) => {
      const name = `${el.type}${i + 1}`;
      lines.push(`local ${name} = Instance.new(\"${el.type}\")`);
      const p = el.props;
      lines.push(`${name}.AnchorPoint = Vector2.new(${p.AnchorPoint.X || 0}, ${p.AnchorPoint.Y || 0})`);
      lines.push(`${name}.Position = UDim2.fromScale(${p.Position.X.toFixed(3)}, ${p.Position.Y.toFixed(3)})`);
      lines.push(`${name}.Size = UDim2.fromScale(${p.Size.X.toFixed(3)}, ${p.Size.Y.toFixed(3)})`);
      if (p.Text !== undefined) lines.push(`${name}.Text = ${JSON.stringify(p.Text)}`);
      if (p.BackgroundColor3) {
        const hex = p.BackgroundColor3.replace('#','');
        const r = parseInt(hex.substring(0,2),16)/255;
        const g = parseInt(hex.substring(2,4),16)/255;
        const b = parseInt(hex.substring(4,6),16)/255;
        lines.push(`${name}.BackgroundColor3 = Color3.new(${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)})`);
      }
      if (p.TextColor3) {
        const hex = p.TextColor3.replace('#','');
        const r = parseInt(hex.substring(0,2),16)/255;
        const g = parseInt(hex.substring(2,4),16)/255;
        const b = parseInt(hex.substring(4,6),16)/255;
        lines.push(`${name}.TextColor3 = Color3.new(${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)})`);
      }
      lines.push(`${name}.Parent = screenGui`);
      lines.push("");
    });

    return lines.join('\n');
  }

  const selected = elements.find((e) => e.id === selectedId);

  return (
    <div className="h-screen flex bg-gray-100 text-gray-900">
      <aside className="w-64 p-4 border-r border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Adicionar</h2>
        <div className="space-y-2">
          <button className="w-full py-2 rounded bg-blue-500 text-white" onClick={() => addElement('Frame')}>Frame</button>
          <button className="w-full py-2 rounded bg-green-500 text-white" onClick={() => addElement('TextLabel')}>TextLabel</button>
          <button className="w-full py-2 rounded bg-indigo-500 text-white" onClick={() => addElement('TextButton')}>TextButton</button>
          <button className="w-full py-2 rounded bg-purple-500 text-white" onClick={() => addElement('TextBox')}>TextBox</button>
        </div>
        <div className="mt-6">
          <button className="w-full py-2 rounded bg-red-500 text-white" onClick={removeSelected} disabled={!selected}>Remover selecionado</button>
        </div>
      </aside>

      <main className="flex-1 p-6 flex">
        <div className="w-96 h-[640px] bg-gray-200 rounded shadow relative" style={{flex: '0 0 360px', height: canvasSize.height}} onClick={() => setSelectedId(null)}>
          <div style={{width: canvasSize.width, height: canvasSize.height, position: 'relative', margin: 'auto', background: '#0f172a', borderRadius: 10, overflow: 'hidden'}}>
            {elements.map((el) => renderElement(el))}
          </div>
        </div>

        <div className="flex-1 ml-6 flex flex-col">
          <div className="flex-1 bg-white rounded shadow p-4 overflow-auto">
            <h3 className="font-semibold mb-2">Propriedades / Editor de código</h3>
            <textarea className="w-full h-full border rounded p-2 font-mono text-xs bg-gray-100" value={codeEdit} onChange={e => setCodeEdit(e.target.value)} placeholder="Edite o código Luau aqui..."></textarea>
          </div>
          <div className="mt-4 bg-white rounded shadow p-3 h-64 overflow-auto">
            <h4 className="font-semibold mb-2">Preview do Luau gerado</h4>
            <pre className="text-xs bg-gray-900 text-green-200 rounded p-2 overflow-auto" style={{fontFamily: 'monospace', fontSize: 12}}>
              {generateLuau()}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
