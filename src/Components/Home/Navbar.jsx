import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa'; 
import "./Navbar.css";
import { auth, signOut, onAuthStateChanged } from '../../firebase'; 

function Navbar() {
    const image = {
        MeanAsLogo: "NobgLogo.png",
        user: "user.png",
    };

    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [isUserDropdownVisible, setIsUserDropdownVisible] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    const handleDropdownClick = () => {
        setDropdownVisible(!isDropdownVisible);
    };

    const handleUserDropdownClick = () => {
        setIsUserDropdownVisible(!isUserDropdownVisible);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/'); 
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <div className="nav">
            <Link to="/" className='logo'>
                <img src={image.MeanAsLogo} alt="MeanAsLogo" />
            </Link>
            <ul className="menu">
                <li><Link id="l1" to="/about">About</Link></li>
                <li><Link id="l1" to="/features">Features</Link></li>
                <li><Link to="/authentication" id="l1">Dashboard</Link></li>
            </ul>
            {!user && (
                <ul className="try">
                    <li><Link id="try" to="/authentication?q=free">Try For Free</Link></li>
                </ul>
            )}
            {user && (
                <div id="besides">
                    <div className="allicons">
                        <img id="dass" src={image.user} alt="User Icon" onClick={handleUserDropdownClick} />
                        {isUserDropdownVisible && (
                            <div className="dropdown-menuz">
                                <Link to="/Profile" className="dropdown-itemz">View Profile</Link>
                                <div className="dropdown-itemz" onClick={handleLogout}>Log out</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <ul className='dropdown'>
                <li>
                    <div className='dropbar' onClick={handleDropdownClick}>
                        <FaBars size={25} />
                    </div>
                </li>
                {isDropdownVisible && (
                    <ul className='dropdown-list'>
                        <li><Link id="l1" to="/about">About</Link></li>
                        <li><Link id="l1" to="/features">Features</Link></li>
                        <li><Link to="/authentication" id="l1">Dashboard</Link></li>
                        <li><Link id="try" to="/authentication?q=free">Try For Free</Link></li>
                    </ul>
                )}
            </ul>
        </div>
    );
}

export default Navbar;
