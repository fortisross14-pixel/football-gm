import React from 'react';

export default class ErrorBoundary extends React.Component{
  constructor(props){super(props);this.state={error:null};}
  static getDerivedStateFromError(error){return {error};}
  componentDidCatch(error,info){console.error('Fútbol Director render error',error,info);}
  render(){if(!this.state.error)return this.props.children;return <div className="fatal-screen"><div className="fatal-card"><span>ERROR RECUPERABLE</span><h1>La interfaz ha encontrado un problema.</h1><p>La partida guardada no se borra. Esta pantalla sustituye el antiguo “pantallazo negro” para que puedas recuperarte sin perder la carrera.</p><code>{String(this.state.error?.message||this.state.error)}</code><div><button className="primary" onClick={()=>window.location.reload()}>Recargar juego</button><button onClick={()=>{window.location.hash='';window.location.reload()}}>Volver a abrir</button></div></div></div>}
}
