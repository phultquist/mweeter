export default function Button(props: { text: string, onClick: () => void, disabled?: boolean }) {
    return <button disabled={props.disabled} onClick={props.onClick} className={`py-3 px-5 text-sm font-semibold text-white bg-[#5E65BA] hover:bg-[#5158a3] transition-all rounded-lg disabled:opacity-60`}>{props.text}</button>
}