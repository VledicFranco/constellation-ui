import DefaultLayout from "@/layouts/default";
import { Button } from "@heroui/button";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";

function SignButton() {
    const login = useGoogleLogin({
        flow: "auth-code",
        onSuccess: (credentialResponse) => {
            console.log(credentialResponse);
        },
        onError: () => {
            console.log('Login Failed');
        },
    });

    return <Button color="secondary" onPress={login}>Continue with Google</Button>;
}

export default function SigninPage() {
    return (
        <DefaultLayout>
            <GoogleOAuthProvider clientId="707998124404-mic3tgreh8i21ti3r9561ouofpu2m5mg.apps.googleusercontent.com">
            <div className="flex items-center justify-center h-full">
                <SignButton />
            </div>
            </GoogleOAuthProvider>
        </DefaultLayout>
    );
}