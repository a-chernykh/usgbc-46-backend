# Setup

    $ npm install -g gulp-cli
    $ npm install
    
# Configure

Update ```~/.aws/credentials``` to add this profile exactly as is:
    
    [aws-hack-16-deploy]
    aws_access_key_id = AKIAJL2LP2CCWEUODF3Q
    aws_secret_access_key = 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
    
# Build and Deploy

    $ gulp

# Test Query

    curl https://h5c128n3tb.execute-api.us-west-2.amazonaws.com/dev/leaderboard
