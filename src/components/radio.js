import React from "react";

export function Radio({ name, value, onChange, options }) {
  return options.map((o) => {
    return (
      <label
        key={o.value}
        style={{ paddingRight: "20px", marginRight: "10px" }}
      >
        <input
          type="radio"
          name={name}
          value={o.value}
          checked={value === o.value}
          onChange={(e) => onChange(e.target.value)}
        />
        {o.label}
      </label>
    );
  });
}
