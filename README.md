# What is this for?

This is a command line utility which abstracts the Confluence API and allows a Mongo instance to be populated with a complete record of all new Confluence posts in a given space.

# How do I run it?

1. npm i
2. From root directory of project:
   `node index`

It will run with no environment variables, so long as the user provides those values in the initial prompting stage. However, a .env.example file has also been included. To use that, take the .example off the end, and fill out the variables with your desired ones.

# How do I authenitcate?

The Confluence API uses Basic Auth. This script assumes you will pass in your token directly e.g. if you pass in 'my-secret-token' as the access token, this will be put into an Authorization header as 'Basic my-secret-token'. You can manage your API tokens here: https://id.atlassian.com/manage-profile/security/api-tokens

# What then?

The main point is to seed the Mongo instance with enough information to use with the Mongo GUI, which allows people to tag pages manually, and mark them as triaged - whilst maintaining a shared picture of what still needs to be done.
