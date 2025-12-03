"use client";
import React, { useState, useEffect } from "react";
import { api } from './apiUtils.js';

const ApiTest = () => {
    const [apiStatus, setApiStatus] = useState("Testing...");
    const [apiData, setApiData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const testAPIs = async () => {
            try {
                const data = await api.siteConfig();
                setApiData(data);
                setApiStatus("✅ API Working!");
                setError(null);
                
            } catch (err) {
                console.error('API Test Error:', err);
                setApiStatus("❌ API Failed");
                setError(err.message);
            }
        };

        testAPIs();
    }, []);

    return (
        <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-sm">
            <h3 className="font-bold text-sm mb-2">API Connection Test</h3>
            <div className="text-xs">
                <p className={apiStatus.includes("✅") ? "text-green-600" : "text-red-600"}>
                    {apiStatus}
                </p>
                {error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-800 font-medium">Error:</p>
                        <p className="text-red-600">{error}</p>
                    </div>
                )}
                {apiData && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                        <p className="text-green-800 font-medium">Data Received:</p>
                        <p className="text-green-700 text-xs break-all">
                            {JSON.stringify(apiData).substring(0, 100)}...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApiTest;