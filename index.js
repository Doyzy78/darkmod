document.body.style.display = "flex";
document.body.style.flexDirection = "column";
document.body.style.justifyContent = "center";
document.body.style.alignItems = "center";
document.body.style.minHeight = "100vh";
document.body.style.textAlign = "center";

function createElement(tag, props = {}, styles = {}, children = []) {
  const el = document.createElement(tag);
  Object.assign(el, props);
  Object.assign(el.style, styles);
  children.forEach(child => el.appendChild(child));
  return el;
}

// Title
document.body.appendChild(createElement("h1", {
  innerText: "DARKMODZ ENGINE"
}, {
  color: "#ff0055",
  textShadow: "0 0 8px #ff0055",
  marginBottom: "20px"
}));

const box = createElement("div", {}, {
  background: "#1a1a1a",
  border: "2px solid #00ffcc",
  borderRadius: "12px",
  padding: "20px",
  width: "90%",
  maxWidth: "500px",
  boxSizing: "border-box"
});
document.body.appendChild(box);

const valueInput = createElement("input", {
  placeholder: "e.g. 999999 or 1.5 or true"
}, commonStyle());
box.appendChild(createElement("label", { innerText: "Enter Value:" }));
box.appendChild(valueInput);

const typeSelect = createElement("select", {}, commonStyle());
["int", "bool", "float"].forEach(type => {
  const opt = document.createElement("option");
  opt.value = opt.textContent = type.toUpperCase();
  typeSelect.appendChild(opt);
});
box.appendChild(createElement("label", { innerText: "Select Type:" }));
box.appendChild(typeSelect);

const archSelect = createElement("select", {}, commonStyle());
["64-BIT", "32-BIT"].forEach(arch => {
  const opt = document.createElement("option");
  opt.value = opt.textContent = arch;
  archSelect.appendChild(opt);
});
box.appendChild(createElement("label", { innerText: "Architecture:" }));
box.appendChild(archSelect);

const output = createElement("div", {
  innerText: "Hex Output Will Appear Here..."
}, {
  marginTop: "20px",
  background: "#000",
  border: "1px dashed #0ff",
  padding: "10px",
  color: "#00ff88",
  fontWeight: "bold",
  whiteSpace: "pre-line",
  wordWrap: "break-word"
});
box.appendChild(output);

const convertBtn = createElement("button", { innerText: "Convert" }, buttonStyle());
convertBtn.onclick = () => output.innerText = convert(valueInput.value, typeSelect.value, archSelect.value);
box.appendChild(convertBtn);

const copyBtn = createElement("button", { innerText: "Copy" }, buttonStyle());
copyBtn.onclick = () => {
  navigator.clipboard.writeText(output.innerText);
  alert("Hex copied!");
};
box.appendChild(copyBtn);

function convert(valRaw, type, arch) {
  const val = valRaw.trim().toLowerCase();
  try {
    if (type === "BOOL") {
      return arch === "64-BIT" ? "20 00 80 D2 C0 03 5F D6" : "00 00 A0 E3 1E FF 2F E1";
    } else if (type === "INT") {
      const num = parseInt(valRaw);
      if (isNaN(num)) throw new Error("Invalid INT value");
      if (arch === "64-BIT") {
        const low16 = num & 0xFFFF;
        const high16 = (num >> 16) & 0xFFFF;
        const movz = 0xD2800000 | (low16 << 5);
        const movk = 0xF2800000 | (high16 << 5) | (1 << 21);
        return toHexLE(movz) + " " + toHexLE(movk) + " C0 03 5F D6";
      } else {
        const movw = 0xE3000000 | (((num & 0xF000) << 4) | (num & 0x0FFF));
        const movt = 0xE3400000 | ((((num >> 16) & 0xF000) << 4) | ((num >> 16) & 0x0FFF));
        return toHexLE(movw) + " " + toHexLE(movt) + " 1E FF 2F E1";
      }
    } else if (type === "FLOAT") {
      const f = parseFloat(valRaw);
      if (isNaN(f)) throw new Error("Invalid FLOAT value");
      const buffer = new ArrayBuffer(4);
      new DataView(buffer).setFloat32(0, f, true);
      const ieee = new Uint32Array(buffer)[0];
      if (arch === "32-BIT") {
        const lower = ieee & 0xFFFF;
        const upper = (ieee >> 16) & 0xFFFF;
        const movw = 0xE3000000 | ((lower & 0xF000) << 4) | (lower & 0x0FFF);
        const movt = 0xE3400000 | ((upper & 0xF000) << 4) | (upper & 0x0FFF);
        return toHexLE(movw) + " " + toHexLE(movt) + " 1E FF 2F E1";
      } else {
        return toHexLE(ieee) + " 00 00 20 1E C0 03 5F D6";
      }
    }
  } catch (err) {
    return "Error: " + err.message;
  }
}

function toHexLE(num) {
  return [0, 8, 16, 24].map(s => ((num >> s) & 0xFF).toString(16).padStart(2, '0')).join(' ').toUpperCase();
}

function commonStyle() {
  return {
    display: "block",
    fontSize: "16px",
    background: "#000",
    color: "#0ff",
    border: "1px solid #0ff",
    padding: "10px",
    borderRadius: "5px",
    width: "90%",
    margin: "10px auto"
  };
}

function buttonStyle() {
  return {
    background: "#ff0055",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    marginTop: "15px",
    cursor: "pointer"
  };
}
