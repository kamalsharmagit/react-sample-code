import React, { useEffect, useState } from 'react';
import { endpoint } from 'api/endpoint';
import { useSelector, useDispatch } from 'react-redux';
import CatalogueCardConcept from 'component/Catalogue/CatalogueCardConcept';
import HeaderImages from 'asset/image/new-Events.jpg';
import { Row, Col } from 'react-bootstrap';
import { apiHandler } from 'api';
import { saveEvent } from 'features/catalogue/catalogueDataSlice';
import Breadcrew from 'component/Breadcrumb/BreadCrumb';
import EventsCard from 'component/EventsCard/Eventcard';
import { MetaTags } from 'react-meta-tags';

const Events = (props) => {
	const { event } = useSelector((state) => state.catalogue);
	const [loader, setLoader] = useState(false);

	const dispatch = useDispatch();
	const getBreadCrumbData = () => {
		let list = [];
		list.push({ name: 'Home', url: '/' });
		list.push({ name: 'Events' });

		return list;
	};
	useEffect(() => {
		getPressrelease();
	}, []);
	const getPressrelease = async () => {
		setLoader(true);
		const result = await apiHandler({
			url: endpoint.EVENTS,
		});
		if (result.data) {
			dispatch(saveEvent(result.data));
			// console.log('.......events', result.data);
			setLoader(false);

			// saveCatalogue(result.data);
		} else {
			dispatch(saveEvent([]));
			setLoader(false);
		}
		setLoader(false);
	};

	return (
		<>
			<MetaTags>
				<title>Leading bathroom fittings and accessories brand in India</title>
			</MetaTags>
			<div className='banner'>
				<img src={HeaderImages} alt='' />
				<Breadcrew data={getBreadCrumbData()} />
			</div>
			<section>
				<div className='container'>
					{/* <div className=' main-heading text-left'>
						<h2>Events</h2>
					</div> */}
					<div className='row'>
						{event &&
							event.map((item, i) => (
								<div key={i} className='col-md-4 mt-2'>
									<EventsCard details={item} typeName='Events' />
								</div>
							))}
						<div className='extraspace back-color-register '></div>
					</div>
				</div>
			</section>
			{loader && (
				<div className='loading-overlay'>
					<div className='bounce-loader'>
						<div className='bounce1'></div>
						<div className='bounce2'></div>
						<div className='bounce3'></div>
					</div>
				</div>
			)}
		</>
	);
};

export default Events;
