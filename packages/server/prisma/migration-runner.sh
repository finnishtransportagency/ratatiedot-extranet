while getopts n:p:d: flag
do
    case "${flag}" in
        n) name=${OPTARG};;
        p) password=${OPTARG};;
        d) domain=${OPTARG};;
    esac
done

database_name=$(aws ssm get-parameter \
    --name $name \
    --query 'Parameter.Value' \
    --output text)
database_domain=$(aws ssm get-parameter \
    --name $domain \
    --query 'Parameter.Value' \
    --output text)
database_password=$(aws ssm get-parameter \
    --name $password \
    --with-decryption \
    --query 'Parameter.Value' \
    --output text)

DATABASE_URL='postgresql://'${database_name}':'${database_password}'@'${database_domain}'5432/'${database_name}'?schema=public'

npx prisma migrate deploy
