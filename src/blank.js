import defined from 'defined';

export default function blank (value) {
    return defined(value, '');
}
