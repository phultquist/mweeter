export default function SecondaryButton(props: { text: string, onClick: () => void }) {
    return <button onClick={props.onClick} className="py-[0.1rem] px-3 text-sm bg-white border border-gray-300 rounded-full ml-4 hover:bg-gray-100 transition-all">{props.text}</button>
}


