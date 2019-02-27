import React, { lazy, Suspense } from 'react';
const Globe = lazy(() => import(/* webpackChunkName: "Universe" */'@/component/Universe'));

const mainStyle : React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
};

class Main extends React.Component {
    public render() {
        return (
          <div style={mainStyle}>
              <Suspense fallback={<div>Loading...</div>}>
                <Globe />
              </Suspense>
          </div>
        );
    }
}

const AppMain = <Main />;

export { AppMain };
