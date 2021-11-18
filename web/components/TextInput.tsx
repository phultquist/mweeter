export default function TextInput(props: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
}) {
    const { value, onChange, placeholder, label } = props;
    return (
        <div className="w-full">
            {label && <p className="font-semibold text-xs text-gray-900 pb-1">{label}</p>}
            <input
                className={`w-full border border-gray-300 rounded-md p-2 shadow-sm text-gray-600 ${props.disabled ? 'bg-gray-100' : 'bg-white'}`}
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={props.disabled}
            />
        </div>
    );
}