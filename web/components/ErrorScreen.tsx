export default function ErrorScreen(props: { text: string }) {
    return (<div className="p-16">
        <h1>Something Went Wrong</h1>
        <p>{props.text}</p>
    </div>);
}