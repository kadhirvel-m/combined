from google.cloud import storage
import os

def download_folder_from_bucket(bucket_name, folder_prefix, destination_directory):
    """Downloads all objects within a specified folder (prefix) from a bucket
    to a local directory, maintaining the folder structure.
    """
    storage_client = storage.Client()
    bucket = storage_client.get_bucket(bucket_name)

    # Ensure the destination directory exists
    if not os.path.exists(destination_directory):
        os.makedirs(destination_directory)

    # List blobs with the specified folder_prefix
    # The delimiter parameter is important for listing only objects directly within the folder
    # but for a full download including subfolders, you might omit it or handle it carefully.
    # For downloading everything under a prefix, it's generally better to just use the prefix.
    blobs = bucket.list_blobs(prefix=folder_prefix) 

    downloaded_count = 0
    for blob in blobs:
        # Construct the full local path.
        # We need to remove the bucket's folder_prefix from the blob.name
        # to correctly place files relative to the destination_directory.
        # For example, if folder_prefix is 'img_gen/' and blob.name is 'img_gen/image.png',
        # we want the local path to be 'destination_directory/image.png'.
        relative_path = os.path.relpath(blob.name, folder_prefix)
        local_file_path = os.path.join(destination_directory, relative_path)
        
        # Ensure the local subdirectory exists for the current file
        local_dir = os.path.dirname(local_file_path)
        if not os.path.exists(local_dir):
            os.makedirs(local_dir)

        print(f"Downloading {blob.name} to {local_file_path}")
        blob.download_to_filename(local_file_path)
        downloaded_count += 1

    print(f"Finished downloading {downloaded_count} objects from folder '{folder_prefix}' "
          f"in bucket '{bucket_name}' to '{destination_directory}'.")

# --- Configuration for your download ---

# Your Google Cloud Storage bucket name
my_bucket_name = 'paperx-pro'

# The exact folder you want to download (including the trailing slash '/')
# For example, 'img_gen/'
my_folder_to_download = 'img_gen/'

# The local directory where you want to save the downloaded files
# This folder will be created if it doesn't exist.
my_local_destination = 'downloaded_img_gen_folder'

# --- Run the download function ---
download_folder_from_bucket(my_bucket_name, my_folder_to_download, my_local_destination)
