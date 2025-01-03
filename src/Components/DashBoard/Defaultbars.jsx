import React, { useState } from 'react';
import "./Defaultbars.css";
import { Link, useNavigate} from "react-router-dom";
import { FaBars } from 'react-icons/fa';
import { auth, signOut } from '../../firebase';

function Defaultbars() {
    const dashimg = {
        not: "notification.png",
        user: "user.png",
        over: "window.png",
        proj: "layers.png",
        team: "group.png",
        upgrad: "clean.png"
    };

    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [isUserDropdownVisible, setIsUserDropdownVisible] = useState(false);
    const navigate = useNavigate();

    const handleMenuClick = () => {
        setIsMenuVisible(!isMenuVisible);
    };

    const handleUserDropdownClick = () => {
        setIsUserDropdownVisible(!isUserDropdownVisible);
    };


    /*It has some codes to deal with firebase so we check it out and create the rule*/
    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("User signed out");
            navigate('/'); 
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <div className="defaultbars">
            <div className="flatbars">
                <div id="rights">
                    <div className="allicons"><img id="dass" src={dashimg.not} alt="#" /></div>
                </div>
                <div id="besides">
                    <div className="allicons">
                        <img id="dass" src={dashimg.user} alt="#" onClick={handleUserDropdownClick} />
                        {isUserDropdownVisible && (
                            <div className="dropdown-menu">
                                <Link to="/profile" className="dropdown-item">View Profile</Link>
                                <div className="dropdown-item" onClick={handleLogout}>Log out</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="sidebars">
                <Link className="compilogos" to="/">
                    <img src="NobgLogo.png" alt="Logo"/>
                </Link>
                <ul className="dashys">
                    <Link className="dashlis" to="/dashboard"><div className="dashs"><img id="dass" src={dashimg.over} alt="Overview" /></div>Overview</Link>
                    <Link className="dashlis" to="/projects"><div className="dashs"><img id="dass" src={dashimg.proj} alt="Projects" /></div>Projects</Link>
                    <Link className="dashlis" to="/teamconnect"><div className="dashs"><img id="dass" src={dashimg.team} alt="Team Connect" /></div>Team Connect</Link>
                </ul>
                <Link id="upgras" to="/pricing">
                    <div>
                        <div className="allicons">
                            <img id="dass" src={dashimg.upgrad} alt="Upgrade" />
                        </div>
                        <h3>Upgrade to Unlimited Plan</h3>
                    </div>
                    <p>Access unlimited clarity and accuracy for your analysis.</p>
                </Link>
            </div>
            <div className='phoneversion'>
                <ul className='dropdowns'>
                    <li>
                        <div className='dropbarps' onClick={handleMenuClick}>
                            <FaBars size={25} />
                        </div>
                    </li>
                    {isMenuVisible && (
                        <ul className='dropdown-lists'>
                            <li><Link className="dashlis" to="/dashboard"><div className="dashs"><img id="dass" src={dashimg.over} alt="Overview" /></div>Overview</Link></li>
                            <li><Link className="dashlis" to="/projects"><div className="dashs"><img id="dass" src={dashimg.proj} alt="Projects" /></div>Projects</Link></li>
                            <li><Link className="dashlis" to="/teamconnect"><div className="dashs"><img id="dass" src={dashimg.team} alt="Team Connect" /></div>Team Connect</Link></li>
                            <li>
                                <Link id="upgrap" to="/pricing">
                                    <div>
                                        <div className="alliconp">
                                            <img id="dass" src={dashimg.upgrad} alt="Upgrade to Unlimited Plan" />
                                        </div>
                                        <h3>Upgrade to Unlimited Plan</h3>
                                    </div>
                                    <p>Access unlimited clarity and accuracy for your analysis.</p>
                                </Link>
                            </li>
                        </ul>
                    )}
                </ul>
                <Link className="compilogop" to="/">
                    <img src="NobgLogo.png" alt="Logo"/>
                </Link>
                <div className="flatbarp">
                    <div id="rightp">
                        <div className="alliconp"><img id="dass" src={dashimg.not} alt="#" /></div>
                    </div>
                    <div id="besidep">
                        <div className="alliconp">
                            <img id="dass" src={dashimg.user} alt="#" onClick={handleUserDropdownClick} />
                            {isUserDropdownVisible && (
                                <div className="dropdown-menu">
                                    <Link to="/profile" className="dropdown-item">View Profile</Link>
                                    <div className="dropdown-item" onClick={handleLogout}>Log out</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Defaultbars;
