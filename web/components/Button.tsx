export default function Button(props: { text: string, onClick: () => void }) {
    return <button onClick={props.onClick} className="py-3 px-5 text-sm font-semibold text-white bg-[#5E65BA] hover:bg-[#5158a3] transition-all rounded-lg">{props.text}</button>
}