interface inputFieldProps {

}

const InputField: React.FC<inputFieldProps> = ({}) => {
    return (
        <input className="w-full h-8 mt-2 mb-4 px-3 text-sm border bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
    )
}

export default InputField