"""TO-DO: Write a description of what this XBlock is."""

import pkg_resources
from functools import partial

from django.conf import settings

from xblock.core import XBlock
from xblock.fields import Scope, Integer, String
from xblock.fragment import Fragment

from webob.response import Response
from xmodule.contentstore.content import StaticContent
from xmodule.contentstore.django import contentstore


class TinyMceXBlock(XBlock):
    """
    TO-DO: document what your XBlock does.
    """

    # Fields are defined on the class.  You can access them in your code as
    # self.<fieldname>.
    display_name = String(display_name="Display Name",
                          default="TinyMCE",
                          scope=Scope.settings,
                          help="This name appears in the horizontal navigation at the top of the page.")
    thumbnail_url = String(help="URL of the thumblnail image", default=None, scope=Scope.content)
    background_url = String(help="URL of the background image", default=None, scope=Scope.content)
    text_color = String(help="Color of displayed text", default='#aaaaaa', scope=Scope.content)
    content_text = String(help="Paragraph text content", default='', scope=Scope.content)

    def resource_string(self, path):
        """Handy helper for getting resources from our kit."""
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    # TO-DO: change this view to display your data your own way.
    def student_view(self, context=None):
        """
        The primary view of the TinyMceXBlock, shown to students
        when viewing courses.
        """

        html_str = pkg_resources.resource_string(__name__, "static/html/tinymcexblock.html")
        frag = Fragment(unicode(html_str).format(
                                                display_name=self.display_name,
                                                thumbnail_url=self.thumbnail_url,
                                                background_url=self.background_url,
                                                text_color=self.text_color,
                                                content_text=self.content_text
                                                ))

        frag.add_css(self.resource_string("static/css/tinymcexblock.css"))
        frag.add_javascript(self.resource_string("static/js/src/tinymcexblock.js"))
        frag.initialize_js('TinyMceXBlock')
        return frag

    # TO-DO: change this view to display your data your own way.
    def studio_view(self, context=None):
        """
        The primary view of the TinyMceXBlock, shown to students
        when viewing courses.
        """
        html_str = pkg_resources.resource_string(__name__, "static/html/studio_view.html")
        # display variables
        frag = Fragment(unicode(html_str).format(
                                                display_name=self.display_name,
                                                display_description=self.display_description,
                                                thumbnail_url=self.thumbnail_url,
                                                background_url=self.background_url,
                                                text_color=self.text_color,
                                                content_text=self.content_text
                                                ))
        
        frag.add_css(self.resource_string("static/css/tinymcexblock.css"))
        frag.add_javascript(self.resource_string("static/js/src/studio_view.js"))
        
        frag.initialize_js('StudioEditSubmit')

        return frag

    @XBlock.handler
    def studio_submit(self, request, suffix=''):
        """
        Called when submitting the form in Studio.
        """
        data = request.POST
        self.display_name = data['display_name']
        self.display_description = data['display_description']
        self.text_color = data['text_color']
        self.content_text = data['content_text']

        if not isinstance(data['thumbnail'], basestring):
            upload = data['thumbnail']

            filename = self._file_storage_name(upload.file.name)
            content_location = StaticContent.compute_location(self.location.course_key, filename)

            chunked = upload.file.multiple_chunks()
            sc_partial = partial(StaticContent, content_location, filename, upload.file.content_type)
            if chunked:
                content = sc_partial(upload.file.chunks())
                tempfile_path = upload.file.temporary_file_path()
            else:
                content = sc_partial(upload.file.read())
                tempfile_path = None

            contentstore().save(content)

            # readback the saved content - we need the database timestamp
            readback = contentstore().find(content.location)
            locked = getattr(content, 'locked', False)
            self.thumbnail_url = StaticContent.serialize_asset_key_with_slash(content.location)

        if not isinstance(data['background'], basestring):
            upload = data['background']

            filename = self._file_storage_name(upload.file.name)
            content_location = StaticContent.compute_location(self.location.course_key, filename)

            chunked = upload.file.multiple_chunks()
            sc_partial = partial(StaticContent, content_location, filename, upload.file.content_type)
            if chunked:
                content = sc_partial(upload.file.chunks())
                tempfile_path = upload.file.temporary_file_path()
            else:
                content = sc_partial(upload.file.read())
                tempfile_path = None

            contentstore().save(content)

            # readback the saved content - we need the database timestamp
            readback = contentstore().find(content.location)
            locked = getattr(content, 'locked', False)
            self.background_url = StaticContent.serialize_asset_key_with_slash(content.location)

        return Response(json_body={'result': 'success'})

    def _file_storage_name(self, filename):
        # pylint: disable=no-member
        """
        Get file path of storage.
        """
        path = (
            '{loc.block_type}/{loc.block_id}'
            '/{filename}'.format(
                loc=self.location,
                filename=filename
            )
        )
        return path

    # TO-DO: change this to create the scenarios you'd like to see in the
    # workbench while developing your XBlock.
    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [
            ("TinyMceXBlock",
             """<tinymcexblock/>
             """),
            ("Multiple TinyMceXBlock",
             """<vertical_demo>
                <tinymcexblock/>
                <tinymcexblock/>
                <tinymcexblock/>
                </vertical_demo>
             """),
        ]
