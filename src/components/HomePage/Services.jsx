import React from 'react';
import Service from './Service';
import { services } from '../../data/data';

const Services = () => {
    return (
        <section className="section bg-gray-200" id="services">
            <div className="section-title">
                <h2 className="text-gray-600 font-expletus">Dịch Vụ</h2>
                <div className={`underline bg-gray-800`}></div>
            </div>
            <div className="section-center bg-gray-50  rounded-3xl">
                <div className="flex flex-wrap">
                    {services.map(ser => (
                        <Service key={ser.id} {...ser} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
