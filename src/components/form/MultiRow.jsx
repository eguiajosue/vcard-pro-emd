export default function MultiRow({ isFirst, type, value, types, inputType, placeholder, onTypeChange, onValueChange, onRemove }) {
  return (
    <div className={`multi-row${isFirst ? ' first-row' : ''}`}>
      <select className={`${inputType === 'tel' ? 'phone' : 'email'}-type`} value={type} onChange={e => onTypeChange(e.target.value)}>
        {types.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <input
        type={inputType}
        className={`${inputType === 'tel' ? 'phone' : 'email'}-value`}
        placeholder={placeholder}
        value={value}
        onChange={e => onValueChange(e.target.value)}
      />
      <button type="button" className="btn-del" onClick={onRemove}><i className="fa-solid fa-trash"></i></button>
    </div>
  );
}
