import { doSignInWithEmailAndPassword } from "../../../../firebase/auth";
import { useAuth } from "../../../../context/authContext";


const Login = ()  => {
    const { userLoggIn } = useAuth()
    
    const [email, setEmail] = userState('')
    const [password, setPassword] = useState('')
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')


    const onSubmit = async (e) => {
        e.preventDefault()
        if(!isSigningIn) {
            setIsSigningIn(true)
            await doSignInWithEmailAndPassword(email, password)
        }
    }

    return (
        <div>
            {userLoggIn && (<Navigate to={'/home'} replace={true} />)}
        </div>
    )

}