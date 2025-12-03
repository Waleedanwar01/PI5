export default function SimpleFooter() {
    return (
        <footer className="bg-blue-600 text-white p-8">
            <div className="max-w-7xl mx-auto text-center">
                <h3 className="text-2xl font-bold mb-4">Ocean Wave Footer</h3>
                <p className="text-blue-100 mb-4">Tailwind is working! Visit /footer-demo for the full ocean wave design.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="bg-blue-700 p-4 rounded">
                        <h4 className="font-semibold">Feature 1</h4>
                        <p className="text-sm">Ocean wave animations</p>
                    </div>
                    <div className="bg-blue-700 p-4 rounded">
                        <h4 className="font-semibold">Feature 2</h4>
                        <p className="text-sm">Responsive design</p>
                    </div>
                    <div className="bg-blue-700 p-4 rounded">
                        <h4 className="font-semibold">Feature 3</h4>
                        <p className="text-sm">Modern styling</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}