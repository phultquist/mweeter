export default function Button(props: { text: string, onClick: () => void }) {
    return <button onClick={props.onClick} className="py-3 px-5 text-sm font-semibold text-white bg-indigo-600 rounded-lg">{props.text}</button>
}