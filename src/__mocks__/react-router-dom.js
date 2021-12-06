import React from 'react';

const rrd = require('react-router-dom');
// Just render plain root element with its children
rrd.BrowserRouter = ({ children }) => <div>{children}</div>;
module.exports = rrd;
